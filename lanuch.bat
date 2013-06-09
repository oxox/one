@echo off
set NWFOLDER=E:\Camp\Documents\GitHub\mamboer\nwapp\nw
set NWEXE=%NWFOLDER%\nw.exe
copy package.json %NWFOLDER%
start "" %NWEXE% --url="file:///E:/Camp/Documents/GitHub/oxox/one/default.html"
rem;;exit