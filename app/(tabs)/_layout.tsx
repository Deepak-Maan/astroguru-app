import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';

import { useLiveChatStore } from '../../src/store/liveChatStore';

/* ── SVG Icons matching user's exact design screenshot ── */
function HomeIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.teal : '#64748B';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={focused ? color : 'none'} stroke={color} strokeWidth={focused ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      {focused && <Path d="M9 22V12h6v10" fill="#FFFFFF" />}
    </Svg>
  );
}

function BirthChartIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.teal : '#64748B';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </Svg>
  );
}

function ConsultTabIcon({ focused }: { focused: boolean }) {
  const color = focused ? '#059669' : '#64748B';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={focused ? color : 'none'} stroke={color} strokeWidth={focused ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Svg>
  );
}

const CompatibilityIcon = ConsultTabIcon;

function ChatTabIcon({ focused, badgeCount }: { focused: boolean; badgeCount?: number }) {
  const color = focused ? colors.teal : '#64748B';
  return (
    <View style={{ position: 'relative' }}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill={focused ? color : 'none'} stroke={color} strokeWidth={focused ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </Svg>
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

function HoroscopeIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.teal : '#64748B';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 3v18h18" />
      <Path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
      <Path d="M14 8h4.7V12.7" />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.teal : '#64748B';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </Svg>
  );
}

/* ── Custom Tab Bar Component with Top Indicator Bar ── */
function CustomTabBar({ state, descriptors, navigation }: any) {
  const isAstrologer = useAuthStore((s) => s.user?.role === 'astrologer');
  const pendingChatsCount = useLiveChatStore((s) => {
    const rooms = s.rooms;
    if (!rooms) return 0;
    let count = 0;
    for (const key in rooms) {
      if (rooms[key]?.status === 'waiting') count++;
    }
    return count;
  });

  return (
    <View style={styles.barContainer}>
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];

          let label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          // Role-based title overrides for Certified Astrologer
          if (isAstrologer) {
            if (route.name === 'index') label = 'Workstation';
            else if (route.name === 'kundli') label = 'Client Vault';
            else if (route.name === 'consult') label = 'Live Chats';
            else if (route.name === 'horoscope') label = 'Transits';
            else if (route.name === 'profile') label = 'Acharya';
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
            >
              {/* Top Emerald Green Indicator Line for Active Tab */}
              {isFocused && <View style={styles.topIndicator} />}

              <View style={styles.iconBox}>
                {route.name === 'index' && <HomeIcon focused={isFocused} />}
                {route.name === 'kundli' && <BirthChartIcon focused={isFocused} />}
                {route.name === 'consult' && (
                  isAstrologer ? (
                    <ChatTabIcon focused={isFocused} badgeCount={pendingChatsCount} />
                  ) : (
                    <ConsultTabIcon focused={isFocused} />
                  )
                )}
                {route.name === 'horoscope' && <HoroscopeIcon focused={isFocused} />}
                {route.name === 'profile' && <ProfileIcon focused={isFocused} />}
              </View>

              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.teal : '#64748B', fontWeight: isFocused ? '800' : '600' },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const authUser = useAuthStore((s) => s.user);

  // Admins must strictly only see the Admin Console, never Seeker tabs
  if (authUser?.role === 'admin') {
    return <Redirect href="/admin" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="kundli"
        options={{
          title: 'Birth Chart',
        }}
      />
      <Tabs.Screen
        name="consult"
        options={{
          title: 'Consult',
        }}
      />
      <Tabs.Screen
        name="horoscope"
        options={{
          title: 'Daily Horoscopes',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
  },
  bar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
    overflow: 'hidden',
    backdropFilter: 'blur(20px) saturate(180%)' as any,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    paddingTop: 4,
  },
  topIndicator: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
  },
  iconBox: {
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    marginTop: 3,
    textAlign: 'center',
  },
});

