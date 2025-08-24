#!/bin/bash

uvicorn main:app --reload &
python -m http.server 5500 &

wait
