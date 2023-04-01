
import React, {useState} from 'react';

import {StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';

interface PercentageBarProps {
  percentage: string;
  width: any;
  height: any;
  backgroundColor: string;
  completedColor: string;
  percentageText?: string;
  isRadius?: boolean;
  styleProps?: StyleProp<ViewStyle>;
};

const PercentageBar = ({
  percentage,
  width,
  height,
  backgroundColor,
  completedColor,
  percentageText,
  isRadius,
  styleProps
}: PercentageBarProps) => {
  return (
    <View style={[{width: width}, styleProps]}>
      <View
        style={{
          width: '100%',
          height: height,
          marginVertical: 3,
          backgroundColor: backgroundColor,
          borderBottomEndRadius: isRadius ? 10 : 0,
          borderTopEndRadius: isRadius ? 10 : 0,
          justifyContent: 'center'
        }}>
        {percentageText && (
          <Text style={{fontSize: 8, marginStart: 10,}}>
            {percentageText}
          </Text>
        )}
      </View>
      <View
        style={{
          width: percentage ? percentage : 0,
          height: height,
          marginVertical: 3,
          backgroundColor: completedColor,
          position: 'absolute',
          borderBottomStartRadius: isRadius ? 10 : 0,
          borderTopStartRadius: isRadius ? 10 : 0,
          justifyContent: 'center'
        }}>
        {percentageText && (
          <Text style={{fontSize: 8, color: 'white', marginStart: 10,}}>
            {percentageText}
          </Text>
        )}
      </View>
    </View>
  );
};
export default PercentageBar;
