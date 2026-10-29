package com.guaco.swipe;

import android.Manifest;
import android.app.Activity;
import android.app.PendingIntent;
import android.app.RecoverableSecurityException;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.provider.MediaStore;
import android.util.Size;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

/** Ventana WebView con la interfaz de Guaco Swipe y puente nativo para leer y mover fotos a la papelera. */
public class MainActivity extends Activity {
    private static final int REQ_PERM = 11, REQ_DEL = 12, REQ_DEL_ONE = 13;
    private static final String HOST = "appassets.local";
    private WebView web;
    private WebViewAssetLoader assets;

    // estado del borrado por lotes
    private final List<Long> pending = new ArrayList<>();
    private final JSONArray done = new JSONArray();
    private List<Long> chunk = new ArrayList<>();
    private int chunkSize = 400;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        assets = new WebViewAssetLoader.Builder().setDomain(HOST).addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        WebView.setWebContentsDebuggingEnabled(true);
        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) {
                    String p = u.getPath() == null ? "" : u.getPath();
                    try {
                        if (p.startsWith("/n/thumb/")) return image(idOf(p), 384, 82);
                        if (p.startsWith("/n/view/")) return image(idOf(p), 1600, 88);
                        if (p.startsWith("/n/fp/")) return fingerprint(idOf(p));
                    } catch (Exception e) {
                        return new WebResourceResponse("text/plain", "utf-8", 404, "Not found", null, new ByteArrayInputStream(new byte[0]));
                    }
                    return assets.shouldInterceptRequest(u.buildUpon().path("/www" + (p.equals("/") ? "/index.html" : p)).build());
                }
                return super.shouldInterceptRequest(v, r);
            }
        });
        web.loadUrl("https://" + HOST + "/index.html");
    }

    private long idOf(String path) { return Long.parseLong(path.substring(path.lastIndexOf('/') + 1)); }
    private Uri uriOf(long id) { return ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id); }

    private WebResourceResponse image(long id, int max, int q) throws Exception {
        ContentResolver cr = getContentResolver();
        Bitmap bm;
        if (Build.VERSION.SDK_INT >= 29) {
            bm = cr.loadThumbnail(uriOf(id), new Size(max, max), null);
        } else {
            BitmapFactory.Options o = new BitmapFactory.Options(); o.inSampleSize = max > 800 ? 2 : 4;
            bm = MediaStore.Images.Thumbnails.getThumbnail(cr, id, max > 800 ? MediaStore.Images.Thumbnails.MINI_KIND : MediaStore.Images.Thumbnails.MINI_KIND, o);
        }
        if (bm == null) throw new Exception("sin imagen");
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        bm.compress(Bitmap.CompressFormat.JPEG, q, out);
        bm.recycle();
        return new WebResourceResponse("image/jpeg", null, new ByteArrayInputStream(out.toByteArray()));
    }

    /** Huella rápida: SHA-1 de los primeros y últimos 16 KB + tamaño (detecta copias idénticas sin leer todo el archivo). */
    private WebResourceResponse fingerprint(long id) throws Exception {
        try (ParcelFileDescriptor pfd = getContentResolver().openFileDescriptor(uriOf(id), "r"); FileInputStream in = new FileInputStream(pfd.getFileDescriptor())) {
            FileChannel ch = in.getChannel();
            long size = ch.size();
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            ByteBuffer buf = ByteBuffer.allocate(16384);
            ch.position(0); int n = ch.read(buf); md.update(buf.array(), 0, Math.max(0, n));
            buf.clear(); ch.position(Math.max(0, size - 16384)); n = ch.read(buf); md.update(buf.array(), 0, Math.max(0, n));
            md.update(Long.toString(size).getBytes());
            StringBuilder sb = new StringBuilder();
            byte[] d = md.digest();
            for (int i = 0; i < 10; i++) sb.append(String.format("%02x", d[i]));
            return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(sb.toString().getBytes()));
        }
    }

    private boolean hasPerm() {
        String p = Build.VERSION.SDK_INT >= 33 ? Manifest.permission.READ_MEDIA_IMAGES : Manifest.permission.READ_EXTERNAL_STORAGE;
        return checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED;
    }

    private void js(final String code) { runOnUiThread(() -> web.evaluateJavascript(code, null)); }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (code == REQ_PERM) js("window.__perm && window.__perm(" + hasPerm() + ")");
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.__back ? window.__back() : false)", v -> { if (!"true".equals(v)) finish(); });
    }

    /* ---------- Borrado por lotes (a la papelera) ---------- */
    private void nextChunk() {
        if (pending.isEmpty()) { finishDelete(); return; }
        chunk = new ArrayList<>(pending.subList(0, Math.min(chunkSize, pending.size())));
        pending.removeAll(chunk);
        List<Uri> uris = new ArrayList<>();
        for (long id : chunk) uris.add(uriOf(id));
        try {
            if (Build.VERSION.SDK_INT >= 30) {
                PendingIntent pi = MediaStore.createTrashRequest(getContentResolver(), uris, true);
                startIntentSenderForResult(pi.getIntentSender(), REQ_DEL, null, 0, 0, 0);
            } else {
                // Android 10 y anteriores: borra uno por uno (Android 10 puede pedir permiso por foto)
                legacyDelete(uris);
            }
        } catch (Exception e) { js("window.__deleted && window.__deleted(" + done.toString() + ",'" + e.getClass().getSimpleName() + "')"); }
    }

    private final List<Uri> legacyQueue = new ArrayList<>();
    private Uri legacyCurrent;
    private void legacyDelete(List<Uri> uris) { legacyQueue.clear(); legacyQueue.addAll(uris); legacyStep(); }
    private void legacyStep() {
        while (!legacyQueue.isEmpty()) {
            Uri u = legacyQueue.remove(0);
            try {
                if (getContentResolver().delete(u, null, null) > 0) done.put(ContentUris.parseId(u));
            } catch (RecoverableSecurityException e) {
                legacyCurrent = u;
                try { startIntentSenderForResult(e.getUserAction().getActionIntent().getIntentSender(), REQ_DEL_ONE, null, 0, 0, 0); return; } catch (IntentSender.SendIntentException x) { /* sigue */ }
            } catch (Exception e) { /* sigue con la siguiente */ }
        }
        nextChunk();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_DEL) {
            if (res == RESULT_OK) for (long id : chunk) done.put(id);
            else pending.clear(); // el usuario canceló: no insistimos con el resto
            nextChunk();
        } else if (req == REQ_DEL_ONE) {
            if (res == RESULT_OK && legacyCurrent != null) {
                try { if (getContentResolver().delete(legacyCurrent, null, null) > 0) done.put(ContentUris.parseId(legacyCurrent)); } catch (Exception e) { /* ignora */ }
            }
            legacyStep();
        }
    }

    private void finishDelete() { js("window.__deleted && window.__deleted(" + done.toString() + ",'')"); }

    /* ---------- Puente hacia la página ---------- */
    private class Bridge {
        @JavascriptInterface public boolean hasPermission() { return hasPerm(); }

        @JavascriptInterface public void requestPermission() {
            if (hasPerm()) { js("window.__perm && window.__perm(true)"); return; }
            String[] p = Build.VERSION.SDK_INT >= 33 ? new String[]{Manifest.permission.READ_MEDIA_IMAGES}
                    : Build.VERSION.SDK_INT >= 29 ? new String[]{Manifest.permission.READ_EXTERNAL_STORAGE}
                    : new String[]{Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE};
            runOnUiThread(() -> requestPermissions(p, REQ_PERM));
        }

        @JavascriptInterface public String listImages() {
            JSONArray arr = new JSONArray();
            String[] cols = {MediaStore.Images.Media._ID, MediaStore.Images.Media.DISPLAY_NAME, MediaStore.Images.Media.SIZE, MediaStore.Images.Media.DATE_TAKEN, MediaStore.Images.Media.DATE_MODIFIED, MediaStore.Images.Media.WIDTH, MediaStore.Images.Media.HEIGHT, MediaStore.Images.Media.BUCKET_DISPLAY_NAME};
            try (Cursor c = getContentResolver().query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cols, null, null, MediaStore.Images.Media.DATE_ADDED + " ASC")) {
                while (c != null && c.moveToNext()) {
                    long taken = c.getLong(3), mod = taken > 0 ? taken : c.getLong(4) * 1000L;
                    JSONArray o = new JSONArray();
                    o.put(c.getLong(0)).put(c.getString(1)).put(c.getLong(2)).put(mod).put(c.getInt(5)).put(c.getInt(6)).put(c.getString(7));
                    arr.put(o);
                }
            } catch (Exception e) { /* devuelve lo que haya */ }
            return arr.toString();
        }

        /** ids en JSON: [1,2,3]. Resultado asíncrono en window.__deleted(idsBorrados, error). */
        @JavascriptInterface public void deleteBatch(String idsJson) {
            try {
                JSONArray a = new JSONArray(idsJson);
                pending.clear();
                while (done.length() > 0) done.remove(0);
                for (int i = 0; i < a.length(); i++) pending.add(a.getLong(i));
                runOnUiThread(MainActivity.this::nextChunk);
            } catch (Exception e) { js("window.__deleted && window.__deleted([],'json')"); }
        }
    }
}
