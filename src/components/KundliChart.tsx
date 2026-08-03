import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { Kundli, PlanetKey } from '../types';
import { PLANETS } from '../data/planets';
import { RASHIS } from '../data/rashis';
import { colors } from '../theme';

interface Props {
  kundli: Kundli;
  size?: number;
}

/**
 * Classic North-Indian (diamond) Kundli.
 *
 * Geometry: a square with both diagonals plus the rhombus joining the four side
 * midpoints. That yields 12 regions — 4 central kites (houses 1/4/7/10) and 8
 * corner triangles. House positions are FIXED; the Rashi numbers rotate so that
 * house 1 always carries the Lagna sign.
 */
export function KundliChart({ kundli, size = 300 }: Props) {
  const S = size;
  const h = S / 2;
  const q = S / 4;
  const t = (3 * S) / 4;

  // Key points
  const TL = [0, 0], TR = [S, 0], BR = [S, S], BL = [0, S];
  const T = [h, 0], R = [S, h], B = [h, S], L = [0, h];
  const C = [h, h];
  const Q1 = [q, q], Q2 = [t, q], Q3 = [t, t], Q4 = [q, t];

  /** house number -> polygon points */
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

  /** Nudge labels toward the visual middle of each region. */
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
        {/* Region fills (subtle alternating tint) */}
        {Object.entries(HOUSES).map(([num, pts]) => (
          <Polygon
            key={`fill-${num}`}
            points={toStr(pts)}
            fill={Number(num) % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(122,60,255,0.10)'}
          />
        ))}

        {/* Frame + internal lines */}
        <G stroke={colors.gold} strokeWidth={1.4} strokeOpacity={0.85}>
          <Polygon points={toStr([TL, TR, BR, BL])} fill="none" />
          <Line x1={TL[0]} y1={TL[1]} x2={BR[0]} y2={BR[1]} />
          <Line x1={TR[0]} y1={TR[1]} x2={BL[0]} y2={BL[1]} />
          <Polygon points={toStr([T, R, B, L])} fill="none" />
        </G>

        {/* House content: rashi number + planets */}
        {Object.entries(HOUSES).map(([numStr, pts]) => {
          const num = Number(numStr);
          const [cx, cy] = centroid(pts);
          const [dx, dy] = LABEL_OFFSET[num];
          const rashiIndex = (kundli.lagnaIndex + num - 1) % 12;
          const planets = kundli.houses[num] ?? [];

          // Stack planet glyphs; keep rows short so they fit in the triangles.
          const perRow = planets.length > 3 ? 2 : 1;
          const rows: PlanetKey[][] = [];
          for (let i = 0; i < planets.length; i += perRow) {
            rows.push(planets.slice(i, i + perRow));
          }

          const labelX = cx + dx;
          const labelY = cy + dy;
          const startY = labelY - ((rows.length - 1) * 11) / 2 + 4;

          return (
            <G key={`content-${num}`}>
              {/* Rashi number (small, gold) */}
              <SvgText
                x={labelX}
                y={labelY - (rows.length > 0 ? 14 + (rows.length - 1) * 5 : 0)}
                fill={colors.gold}
                fontSize={10}
                fontWeight="700"
                textAnchor="middle"
              >
                {rashiIndex + 1}
              </SvgText>

              {rows.map((row, ri) => (
                <SvgText
                  key={ri}
                  x={labelX}
                  y={startY + ri * 11}
                  fill={colors.text}
                  fontSize={10.5}
                  fontWeight="600"
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
          fill={colors.teal}
          fontSize={9}
          fontWeight="700"
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
