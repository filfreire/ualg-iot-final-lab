# ualg-iot-final-lab

> Adapted from `chapter-7` folder of <https://github.com/webofthings/wot-book>

Daniel Martins (a83250) and Filipe Freire (a85493) final laboratory code for IoT course, MEI UALG, 2024

## Prerequisites

- NodeJS v9.0.0
- Python 3.9.2
- EnviroPlus python library (<https://github.com/pimoroni/enviroplus-python>)

Tested with Raspberry Pi Zero W Rev 1.1, running `Raspbian 11 (bullseye) armv6l`, and [EnviroPlus pHAT attached](https://learn.pimoroni.com/article/getting-started-with-enviro-plus).

## Setup

Clone this repository: `git clone https://github.com/filfreire/ualg-iot-final-lab.git`

Change to `ualg-iot-final-lab` directory (`cd ualg-iot-final-lab/`).

Create an account on <https://dashboard.evrythng.com>, and setup an API key, a Project, a Product (which will work as a Thing type, in this case the type is a Raspberry with an EnviroPlus attached), and a "Thng" (an instance of the Product). Also setup an API key for the "Thng".

Add and edit the values of the following environment variables to your `.bashrc`, and then run `source ~/.bashrc`:

```bash
SERVER="https://api.evrythng.com"
EVRYTHNG_API_KEY="CHANGEME"
PROJECT_ID="CHANGEME"
PRODUCT_ID="CHANGEME"
THNG_ID="CHANGEME"
THNG_API_KEY="CHANGEME"
```

Copy the `config-sample.json` to a `config.json` and edit it as well with the appropriate values:

```json
{
 "operatorApiKey":"EDIT-ME",
 "projectId":"EDIT-ME",
 "productId":"EDIT-ME",
 "thngId":"EDIT-ME",
 "appId":"EDIT-ME",
 "appApiKey":"EDIT-ME",
 "thngApiKey":"EDIT-ME"
}
```

Next install dependencies:

```bash
cd ./part1-2-direct-gateway && npm install
cd ./part3-cloud && npm install
```

## How to run

Open 3 terminal sessions and in each run the following commands:

- Start "dummy" CoAP server, which mimics an Arduino with a CO2 sensor attached:

```bash
cd part1-2-direct-gateway && node servers/coap.js
```

- Start `wot-server` server, which exposes EnviroPlus sensor values and the fake CO2 sensor in an HTTP gateway:

```bash
cd part1-2-direct-gateway && node wot-server.js
```

- Start "dummy" CoAP server, which mimics an Arduino with a CO2 sensor attached:

```bash
cd part3-cloud && node plug-with-control.js
```

## Related urls

- <https://github.com/pimoroni/enviroplus-python> - for connecting to the Enviro+ board
- <https://github.com/webofthings/wot-book> - original code adapted
