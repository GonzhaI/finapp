import React from 'react';
import { View, StyleSheet } from 'react-native';

export type OrbDef = {
  color: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width: number;
  height: number;
};

type Props = {
  orbs: OrbDef[];
};

function randomScale(seed: number) {
  return 1 + ((seed * 137.5) % 1) * 0.4;
}

export function BackgroundOrbs({ orbs }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {orbs.map((orb, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            width: orb.width,
            height: orb.height,
            borderRadius: orb.width / 2,
            backgroundColor: orb.color,
            opacity: 1,
            transform: [{ scale: randomScale(i + 1) }],
          }}
        />
      ))}
    </View>
  );
}

// ── Inicio ──────────────────────────────────────────────────
export const homeOrbs: OrbDef[] = [
  { color: 'rgba(100,80,220,0.55)', top: -40, right: -40, width: 200, height: 200 },
  { color: 'rgba(30,180,140,0.35)', left: -50, top: 220, width: 180, height: 180 },
  { color: 'rgba(180,60,120,0.28)', right: -60, bottom: -60, width: 220, height: 220 },
];

export const homeOrbsLight: OrbDef[] = [
  { color: 'rgba(120,100,255,0.18)', top: -40, right: -40, width: 200, height: 200 },
  { color: 'rgba(50,200,160,0.12)', left: -50, top: 220, width: 180, height: 180 },
  { color: 'rgba(220,100,160,0.10)', right: -60, bottom: -60, width: 220, height: 220 },
];

// ── Movimientos ────────────────────────────────────────────
export const movementsOrbs: OrbDef[] = [
  { color: 'rgba(40,140,255,0.4)', top: -30, left: -30, width: 180, height: 180 },
  { color: 'rgba(80,200,160,0.3)', right: -40, bottom: -40, width: 160, height: 160 },
];

export const movementsOrbsLight: OrbDef[] = [
  { color: 'rgba(60,160,255,0.15)', top: -30, left: -30, width: 180, height: 180 },
  { color: 'rgba(100,220,180,0.10)', right: -40, bottom: -40, width: 160, height: 160 },
];

// ── Analítica ──────────────────────────────────────────────
export const analyticsOrbs: OrbDef[] = [
  { color: 'rgba(80,60,200,0.45)', right: -30, top: 80, width: 200, height: 200 },
  { color: 'rgba(30,180,130,0.3)', left: -40, bottom: -40, width: 160, height: 160 },
];

export const analyticsOrbsLight: OrbDef[] = [
  { color: 'rgba(100,80,220,0.15)', right: -30, top: 80, width: 200, height: 200 },
  { color: 'rgba(50,200,150,0.10)', left: -40, bottom: -40, width: 160, height: 160 },
];

// ── Ajustes ────────────────────────────────────────────────
export const settingsOrbs: OrbDef[] = [
  { color: 'rgba(50,140,255,0.3)', top: -20, right: -20, width: 160, height: 160 },
  { color: 'rgba(100,60,200,0.3)', left: -30, bottom: -30, width: 140, height: 140 },
];

export const settingsOrbsLight: OrbDef[] = [
  { color: 'rgba(70,160,255,0.12)', top: -20, right: -20, width: 160, height: 160 },
  { color: 'rgba(120,80,220,0.10)', left: -30, bottom: -30, width: 140, height: 140 },
];

// ── Cuentas ────────────────────────────────────────────────
export const accountsOrbs: OrbDef[] = [
  { color: 'rgba(50,200,160,0.3)', top: -30, right: -30, width: 180, height: 180 },
  { color: 'rgba(100,80,220,0.25)', left: -40, bottom: -40, width: 160, height: 160 },
];

export const accountsOrbsLight: OrbDef[] = [
  { color: 'rgba(70,220,180,0.12)', top: -30, right: -30, width: 180, height: 180 },
  { color: 'rgba(120,100,240,0.10)', left: -40, bottom: -40, width: 160, height: 160 },
];

// ── Categorías ─────────────────────────────────────────────
export const categoriesOrbs: OrbDef[] = [
  { color: 'rgba(255,180,50,0.25)', top: -25, right: -25, width: 160, height: 160 },
  { color: 'rgba(160,100,255,0.25)', left: -35, bottom: -35, width: 140, height: 140 },
];

export const categoriesOrbsLight: OrbDef[] = [
  { color: 'rgba(230,148,18,0.10)', top: -25, right: -25, width: 160, height: 160 },
  { color: 'rgba(160,100,255,0.10)', left: -35, bottom: -35, width: 140, height: 140 },
];

// ── Tipos de Cambio ───────────────────────────────────────
export const exchangeRatesOrbs: OrbDef[] = [
  { color: 'rgba(50,180,255,0.3)', top: -25, left: -25, width: 170, height: 170 },
  { color: 'rgba(50,210,120,0.25)', right: -35, bottom: -35, width: 150, height: 150 },
];

export const exchangeRatesOrbsLight: OrbDef[] = [
  { color: 'rgba(70,200,255,0.12)', top: -25, left: -25, width: 170, height: 170 },
  { color: 'rgba(70,230,140,0.10)', right: -35, bottom: -35, width: 150, height: 150 },
];

// ── Recurrentes ────────────────────────────────────────────
export const recurringOrbs: OrbDef[] = [
  { color: 'rgba(120,100,255,0.35)', top: -30, right: -30, width: 180, height: 180 },
  { color: 'rgba(255,180,50,0.25)', left: -35, bottom: -35, width: 150, height: 150 },
];

export const recurringOrbsLight: OrbDef[] = [
  { color: 'rgba(140,120,255,0.14)', top: -30, right: -30, width: 180, height: 180 },
  { color: 'rgba(230,148,18,0.08)', left: -35, bottom: -35, width: 150, height: 150 },
];

// ── Modales ────────────────────────────────────────────────
export const modalOrbs: OrbDef[] = [
  { color: 'rgba(120,100,255,0.25)', top: -20, right: 0, width: 200, height: 120 },
];

export const modalOrbsLight: OrbDef[] = [
  { color: 'rgba(120,100,255,0.10)', top: -20, right: 0, width: 200, height: 120 },
];

export const exchangeModalOrbs: OrbDef[] = [
  { color: 'rgba(50,180,255,0.25)', top: -20, right: 0, width: 200, height: 120 },
];

export const exchangeModalOrbsLight: OrbDef[] = [
  { color: 'rgba(50,180,255,0.10)', top: -20, right: 0, width: 200, height: 120 },
];
