#!/usr/bin/env python3
import time
from bme280 import BME280
try:
    from smbus2 import SMBus
except ImportError:
    from smbus import SMBus


try:
    # Transitional fix for breaking change in LTR559
    from ltr559 import LTR559
    ltr559 = LTR559()
except ImportError:
    import ltr559


bus = SMBus(1)
bme280 = BME280(i2c_dev=bus)
temperature = bme280.get_temperature()
pressure = bme280.get_pressure()
humidity = bme280.get_humidity()

lux = ltr559.get_lux()
prox = ltr559.get_proximity()
# print("""Light: {:05.02f} Lux, Proximity: {:05.02f}""".format(lux, prox))

print("""{{\"temperature\": \"{:05.2f}\",\"pressure\": \"{:05.2f}\",\"humidity\":\"{:05.2f}\",\"light\": \"{:05.2f}\"}}""".format(temperature, pressure, humidity, lux))