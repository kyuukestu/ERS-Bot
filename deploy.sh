#!/bin/bash

set -e

git pull
bun install
pm2 restart 0
