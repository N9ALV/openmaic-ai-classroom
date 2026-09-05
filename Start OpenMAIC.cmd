@echo off
title OpenMAIC Classroom - keep this window open
cd /d "%~dp0"
node scripts\start-local.mjs
if errorlevel 1 pause
