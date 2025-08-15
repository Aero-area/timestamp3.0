import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { CheckCircle, XCircle, AlertCircle } from "@/components/icons";
import { colors } from "@/constants/colors";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} color={colors.success} />;
      case "error":
        return <XCircle size={20} color={colors.error} />;
      default:
        return <AlertCircle size={20} color={colors.info} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return colors.backgroundSecondary;
      case "error":
        return colors.backgroundSecondary;
      default:
        return colors.backgroundSecondary;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return colors.success;
      case "error":
        return colors.error;
      default:
        return colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      {getIcon()}
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});