package in.ritesh.learnngrow;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private int lastTopInset = 0;
    private int lastBottomInset = 0;
    private View navigationBarProtectionView;

    private String toCssPixels(int insetPx) {
        final float density = getResources().getDisplayMetrics().density;
        final float cssPixels = density > 0 ? insetPx / density : insetPx;
        return String.format(Locale.US, "%.2fpx", cssPixels);
    }

    private void pushInsetsToWebView() {
        if (bridge == null || bridge.getWebView() == null) {
            return;
        }

        final String topInsetCss = toCssPixels(lastTopInset);
        final String bottomInsetCss = toCssPixels(lastBottomInset);
        final String script =
            "document.documentElement.style.setProperty('--app-native-safe-top', '" + topInsetCss + "');" +
            "document.documentElement.style.setProperty('--app-native-safe-bottom', '" + bottomInsetCss + "');";

        bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(script, null));
    }

    private void updateNavigationBarProtection(int protectionHeightPx) {
        if (navigationBarProtectionView == null) {
            return;
        }

        ViewGroup.LayoutParams layoutParams = navigationBarProtectionView.getLayoutParams();
        if (layoutParams != null && layoutParams.height != protectionHeightPx) {
            layoutParams.height = protectionHeightPx;
            navigationBarProtectionView.setLayoutParams(layoutParams);
        }

        navigationBarProtectionView.setVisibility(protectionHeightPx > 0 ? View.VISIBLE : View.GONE);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        super.onCreate(savedInstanceState);

        navigationBarProtectionView = findViewById(R.id.navigation_bar_protection);

        WindowInsetsControllerCompat windowInsetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        getWindow().setNavigationBarColor(Color.BLACK);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setNavigationBarContrastEnforced(false);
        }
        if (windowInsetsController != null) {
            windowInsetsController.setAppearanceLightNavigationBars(false);
        }

        if (bridge != null && bridge.getWebView() != null) {
            WebSettings webSettings = bridge.getWebView().getSettings();
            webSettings.setTextZoom(100);
        }

        setupWindowInsets();
    }

    private void setupWindowInsets() {
        View rootView = findViewById(android.R.id.content);
        if (rootView == null) {
            return;
        }

        ViewCompat.setOnApplyWindowInsetsListener(rootView, (view, windowInsets) -> {
            Insets edgeInsets = windowInsets.getInsetsIgnoringVisibility(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            Insets tappableInsets = windowInsets.getInsetsIgnoringVisibility(
                WindowInsetsCompat.Type.tappableElement()
            );
            lastTopInset = Math.max(edgeInsets.top, 0);
            lastBottomInset = Math.max(edgeInsets.bottom, 0);
            updateNavigationBarProtection(Math.max(tappableInsets.bottom, 0));
            pushInsetsToWebView();
            return windowInsets;
        });

        ViewCompat.requestApplyInsets(rootView);
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
