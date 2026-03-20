package in.ritesh.learnngrow;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private int lastTopInset = 0;
    private int lastBottomInset = 0;

    private void pushInsetsToWebView() {
        if (bridge == null || bridge.getWebView() == null) return;

        final String script =
            "document.documentElement.style.setProperty('--app-native-safe-top', '" + lastTopInset + "px');" +
            "document.documentElement.style.setProperty('--app-native-safe-bottom', '" + lastBottomInset + "px');";

        bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(script, null));
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Enable edge-to-edge: draw behind system bars
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        super.onCreate(savedInstanceState);

        if (bridge != null && bridge.getWebView() != null) {
            WebSettings webSettings = bridge.getWebView().getSettings();
            webSettings.setTextZoom(100);
        }

        // Set up window insets
        setupWindowInsets();
    }

    private void setupWindowInsets() {
        View rootView = findViewById(android.R.id.content);
        if (rootView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(rootView, (view, windowInsets) -> {
                Insets systemBars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                lastTopInset = systemBars.top;
                lastBottomInset = systemBars.bottom;
                pushInsetsToWebView();
                return WindowInsetsCompat.CONSUMED;
            });
            ViewCompat.requestApplyInsets(rootView);
        }

        // Handle toolbar insets
        View toolbar = findViewById(R.id.toolbar);
        if (toolbar != null) {
            ViewCompat.setOnApplyWindowInsetsListener(toolbar, (v, insets) -> {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.statusBars());
                v.setPadding(v.getPaddingLeft(), systemBars.top, v.getPaddingRight(), v.getPaddingBottom());
                return WindowInsetsCompat.CONSUMED;
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        pushInsetsToWebView();

        View rootView = findViewById(android.R.id.content);
        if (rootView != null) {
            ViewCompat.requestApplyInsets(rootView);
        }
    }
}
