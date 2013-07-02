@echo off
set NWFOLDER=E:\Camp\Documents\GitHub\mamboer\nwapp\nw
set NWEXE=%NWFOLDER%\nw.exe
copy package-debug.json %NWFOLDER%\package.json
start "" %NWEXE% --url="file:///E:/Camp/Documents/GitHub/oxox/one/assets/index.html"
exit