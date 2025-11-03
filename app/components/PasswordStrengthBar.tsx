import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Level = {
    label: string;
    labelColor?: string;
    activeBarColor?: string;
};

type Props = {
    password: string;
    showLabel?: boolean;
    labelVisible?: boolean;
    barWidthPercent?: number; // 0–100
    levels?: Level[]; // opcional: si no lo mandas, uso niveles por defecto
};

const defaultLevels: Level[] = [
    { label: "Muy débil", labelColor: "#e74c3c", activeBarColor: "#e74c3c" },
    { label: "Débil", labelColor: "#f1c40f", activeBarColor: "#f1c40f" },
    { label: "Aceptable", labelColor: "#3498db", activeBarColor: "#3498db" },
    { label: "Fuerte", labelColor: "#2ecc71", activeBarColor: "#2ecc71" },
];

const getScore = (password: string) => {
    let score = 0;

    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // score va de 0 a 4
    return score;
};

const PasswordStrengthBar: React.FC<Props> = ({
    password,
    showLabel = true,
    labelVisible, // por compatibilidad con el componente viejo
    barWidthPercent = 100,
    levels,
}) => {
    const finalLevels = levels && levels.length > 0 ? levels : defaultLevels;

    const score = getScore(password);

    // Normalizamos score a índice de niveles
    const maxIndex = finalLevels.length - 1;
    const levelIndex =
        score === 0 ? 0 : Math.min(maxIndex, score - 1); // si score = 1 → índice 0, etc.

    const currentLevel = finalLevels[levelIndex];

    const labelColor = currentLevel.labelColor ?? "#555";
    const barColor = currentLevel.activeBarColor ?? "#3498db";

    // Progreso de la barra: usamos score/4 para 0–1
    const progress = Math.max(0, Math.min(1, score / 4));

    // ¿Mostrar label? (compat showLabel + labelVisible)
    const shouldShowLabel =
        labelVisible !== undefined ? labelVisible : showLabel;

    return (
        <View
            style={[
                styles.container,
                { width: `${barWidthPercent}%` }, // similar a barWidthPercent del lib original
            ]}
        >
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        {
                            flex: progress,
                            backgroundColor: barColor,
                        },
                    ]}
                />
                <View style={{ flex: 1 - progress }} />
            </View>
            {shouldShowLabel && (
                <Text style={[styles.label, { color: labelColor }]}>
                    {currentLevel.label}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        alignSelf: "center",
    },
    barBackground: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "#eee",
        overflow: "hidden",
        flexDirection: "row",
    },
    barFill: {
        borderRadius: 4,
    },
    label: {
        marginTop: 4,
        fontSize: 12,
    },
});

export default PasswordStrengthBar;
