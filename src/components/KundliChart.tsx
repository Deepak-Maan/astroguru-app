import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Kundli, PlanetKey } from '../types';
import { PLANETS } from '../data/planets';
import { RASHIS } from '../data/rashis';
import { colors, radius } from '../theme';

interface Props {
  kundli: Kundli;
  size?: number;
  chartStyle?: 'north' | 'south';
  onHouseSelect?: (houseNum: number) => void;
}

export function KundliChart({ kundli, size = 300, chartStyle = 'north', onHouseSelect }: Props) {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(1);

  const handleHousePress = (houseNum: number) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setSelectedHouse(selectedHouse === houseNum ? null : houseNum);
    if (onHouseSelect) onHouseSelect(houseNum);
  };

  const S = size;
  const h = S / 2;
  const q = S / 4;
  const t = (3 * S) / 4;

  // ── SOUTH INDIAN (FIXED RASHI SQUARES) GEOMETRY ──
  // 12 outer boxes in a 4x4 grid (corners and edges)
  // Rashi fixed clockwise from Pisces (top row 2nd col) to Aquarius
  const boxSize = S / 4;
  const SOUTH_GRID_CELLS: Array<{ rashiIdx: number; col: number; row: number }> = [
    { rashiIdx: 11, col: 1, row: 0 }, // Pisces
    { rashiIdx: 0, col: 2, row: 0 },  // Aries
    { rashiIdx: 1, col: 3, row: 0 },  // Taurus
    { rashiIdx: 2, col: 3, row: 1 },  // Gemini
    { rashiIdx: 3, col: 3, row: 2 },  // Cancer
    { rashiIdx: 4, col: 3, row: 3 },  // Leo
    { rashiIdx: 5, col: 2, row: 3 },  // Virgo
    { rashiIdx: 6, col: 1, row: 3 },  // Libra
    { rashiIdx: 7, col: 0, row: 3 },  // Scorpio
    { rashiIdx: 8, col: 0, row: 2 },  // Sagittarius
    { rashiIdx: 9, col: 0, row: 1 },  // Capricorn
    { rashiIdx: 10, col: 0, row: 0 }, // Aquarius
  ];

  if (chartStyle === 'south') {
    return (
      <View style={[styles.wrap, { width: S, height: S }]}>
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {/* Background Outer Box */}
          <Rect x={0} y={0} width={S} height={S} fill="#FFFFFF" stroke="#D97706" strokeWidth={2} />
          {/* Inner Center Box */}
          <Rect x={boxSize} y={boxSize} width={boxSize * 2} height={boxSize * 2} fill="rgba(217,119,6,0.04)" stroke="#D97706" strokeWidth={1.5} />

          {/* Grid lines */}
          <Line x1={boxSize} y1={0} x2={boxSize} y2={S} stroke="#E2E8F0" strokeWidth={1} />
          <Line x1={boxSize * 2} y1={0} x2={boxSize * 2} y2={S} stroke="#E2E8F0" strokeWidth={1} />
          <Line x1={boxSize * 3} y1={0} x2={boxSize * 3} y2={S} stroke="#E2E8F0" strokeWidth={1} />
          <Line x1={0} y1={boxSize} x2={S} y2={boxSize} stroke="#E2E8F0" strokeWidth={1} />
          <Line x1={0} y1={boxSize * 2} x2={S} y2={boxSize * 2} stroke="#E2E8F0" strokeWidth={1} />
          <Line x1={0} y1={boxSize * 3} x2={S} y2={boxSize * 3} stroke="#E2E8F0" strokeWidth={1} />

          {/* South Indian Cells */}
          {SOUTH_GRID_CELLS.map((cell) => {
            const houseNum = ((cell.rashiIdx - kundli.lagnaIndex + 12) % 12) + 1;
            const isLagna = cell.rashiIdx === kundli.lagnaIndex;
            const isSelected = selectedHouse === houseNum;
            const planets = kundli.houses[houseNum] ?? [];
            const x = cell.col * boxSize;
            const y = cell.row * boxSize;

            return (
              <G key={cell.rashiIdx} onPress={() => handleHousePress(houseNum)}>
                {isSelected && (
                  <Rect x={x} y={y} width={boxSize} height={boxSize} fill="rgba(5, 150, 105, 0.12)" stroke="#059669" strokeWidth={1.5} />
                )}
                {/* Rashi Short Name */}
                <SvgText
                  x={x + 4}
                  y={y + 11}
                  fill="#64748B"
                  fontSize={8}
                  fontWeight="700"
                >
                  {RASHIS[cell.rashiIdx].sanskrit.slice(0, 3)} {isLagna ? '(Asc)' : ''}
                </SvgText>

                {/* House Number in Corner */}
                <SvgText
                  x={x + boxSize - 4}
                  y={y + 11}
                  fill="#D97706"
                  fontSize={8.5}
                  fontWeight="800"
                  textAnchor="end"
                >
                  H{houseNum}
                </SvgText>

                {/* Planets */}
                {planets.map((p, idx) => (
                  <SvgText
                    key={p}
                    x={x + boxSize / 2}
                    y={y + 24 + idx * 11}
                    fill="#1E1B4B"
                    fontSize={9.5}
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {PLANETS[p].short}
                  </SvgText>
                ))}
              </G>
            );
          })}

          {/* Center Info Text */}
          <SvgText x={h} y={h - 10} fill="#059669" fontSize={11} fontWeight="900" textAnchor="middle">
            SOUTH INDIAN (RASI)
          </SvgText>
          <SvgText x={h} y={h + 8} fill="#D97706" fontSize={9.5} fontWeight="800" textAnchor="middle">
            Lagna: {RASHIS[kundli.lagnaIndex].sanskrit}
          </SvgText>
        </Svg>
      </View>
    );
  }

  // ── NORTH INDIAN (DIAMOND) GEOMETRY ──
  const TL = [0, 0], TR = [S, 0], BR = [S, S], BL = [0, S];
  const T = [h, 0], R = [S, h], B = [h, S], L = [0, h];
  const C = [h, h];
  const Q1 = [q, q], Q2 = [t, q], Q3 = [t, t], Q4 = [q, t];

  const HOUSES: Record<number, number[][]> = {
    1: [Q1, T, Q2, C],
    2: [TL, T, Q1],
    3: [TL, Q1, L],
    4: [L, Q1, C, Q4],
    5: [BL, L, Q4],
    6: [BL, Q4, B],
    7: [B, Q4, C, Q3],
    8: [BR, B, Q3],
    9: [BR, Q3, R],
    10: [R, Q3, C, Q2],
    11: [TR, R, Q2],
    12: [TR, Q2, T],
  };

  const LABEL_OFFSET: Record<number, [number, number]> = {
    1: [0, 8], 2: [-6, -14], 3: [-14, -6],
    4: [8, 0], 5: [-14, 6], 6: [-6, 14],
    7: [0, -8], 8: [6, 14], 9: [14, 6],
    10: [-8, 0], 11: [14, -6], 12: [6, -14],
  };

  function centroid(pts: number[][]): [number, number] {
    const x = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const y = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return [x, y];
  }

  const toStr = (pts: number[][]) => pts.map((p) => p.join(',')).join(' ');

  return (
    <View style={[styles.wrap, { width: S, height: S }]}>
      <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        {/* Region fills */}
        {Object.entries(HOUSES).map(([numStr, pts]) => {
          const num = Number(numStr);
          const isSelected = selectedHouse === num;
          return (
            <Polygon
              key={`fill-${num}`}
              points={toStr(pts)}
              fill={isSelected ? 'rgba(5, 150, 105, 0.14)' : num % 2 === 0 ? 'rgba(255,255,255,0.65)' : 'rgba(217,119,6,0.05)'}
              onPress={() => handleHousePress(num)}
            />
          );
        })}

        {/* Frame + internal lines */}
        <G stroke="#D97706" strokeWidth={1.8} strokeOpacity={0.95}>
          <Polygon points={toStr([TL, TR, BR, BL])} fill="none" />
          <Line x1={TL[0]} y1={TL[1]} x2={BR[0]} y2={BR[1]} stroke="#D97706" strokeWidth={1.2} />
          <Line x1={TR[0]} y1={TR[1]} x2={BL[0]} y2={BL[1]} stroke="#D97706" strokeWidth={1.2} />
          <Polygon points={toStr([T, R, B, L])} fill="none" strokeWidth={1.4} />
        </G>

        {/* House content: rashi number + planets */}
        {Object.entries(HOUSES).map(([numStr, pts]) => {
          const num = Number(numStr);
          const [cx, cy] = centroid(pts);
          const [dx, dy] = LABEL_OFFSET[num];
          const rashiIndex = (kundli.lagnaIndex + num - 1) % 12;
          const planets = kundli.houses[num] ?? [];

          const perRow = planets.length > 3 ? 2 : 1;
          const rows: PlanetKey[][] = [];
          for (let i = 0; i < planets.length; i += perRow) {
            rows.push(planets.slice(i, i + perRow));
          }

          const labelX = cx + dx;
          const labelY = cy + dy;
          const startY = labelY - ((rows.length - 1) * 11) / 2 + 4;

          return (
            <G key={`content-${num}`} onPress={() => handleHousePress(num)}>
              {/* Rashi number */}
              <SvgText
                x={labelX}
                y={labelY - (rows.length > 0 ? 14 + (rows.length - 1) * 5 : 0)}
                fill="#D97706"
                fontSize={10}
                fontWeight="900"
                textAnchor="middle"
              >
                {rashiIndex + 1}
              </SvgText>

              {rows.map((row, ri) => (
                <SvgText
                  key={ri}
                  x={labelX}
                  y={startY + ri * 11}
                  fill="#1E1B4B"
                  fontSize={10.5}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {row
                    .map((p) => {
                      const isRetro = kundli.planets.find((x) => x.key === p)?.retrograde;
                      return PLANETS[p].short + (isRetro ? '↺' : '');
                    })
                    .join(' ')}
                </SvgText>
              ))}
            </G>
          );
        })}

        {/* Lagna marker in house 1 */}
        <SvgText
          x={h}
          y={16}
          fill="#059669"
          fontSize={9.5}
          fontWeight="900"
          textAnchor="middle"
        >
          {`LAGNA · ${RASHIS[kundli.lagnaIndex].sanskrit.toUpperCase()}`}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
});
