#ifndef __OLED_H
#define __OLED_H

#define OLED_ADDR 0x78
#define OLED_CMD 0  // che do lenh
#define OLED_DATA 1 // che do ghi 
#define OLED_MODE 0 // che do noi tiep 4 day



//-----------------OLED----------------

void OLED_I2C_callBack();

//OLED control
void OLED_WR_Byte(uint8_t dat, uint8_t cmd);
// void OLED_Display_On(void);
void OLED_Display_Off(void);
void OLED_Init(void);
void OLED_Clear(void);
void OLED_ShowString(uint8_t x, uint8_t y, uint8_t *str);
void OLED_Set_Pos(uint8_t x, uint8_t y);

void OLED_showHeart(uint8_t showOrNot);
void OLED_showNum(uint8_t which, uint8_t num);
void OLED_drawChart(float value);

#endif
