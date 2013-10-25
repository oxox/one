@echo off
set NWFOLDER=E:\Camp\Documents\GitHub\mamboer\nwapp\nw
set NWEXE=nw.exe
set APPFOLDER=E:\Camp\Documents\GitHub\oxox\one
copy %NWFOLDER%\*.dll %APPFOLDER%
copy %NWFOLDER%\nw.exe %APPFOLDER%
copy %NWFOLDER%\nw.pak %APPFOLDER%
start "" %NWEXE% --url="file:///%APPFOLDER%/assets/index.html"
exit