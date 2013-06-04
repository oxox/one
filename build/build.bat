@echo off

set APP_NAME=one
set APP_VERSION=
set APP_SRCFILES=@files.txt
set NW_FOLDER=..\..\..\mamboer\nwapp\nw
set NWAPP_FOLDER=..\..\..\mamboer\nwapp\release
set NW_BUILDFILES=%NW_FOLDER%\nwfiles.txt
set TEMPFOLDER=_temp

call %NW_FOLDER%\make.bat

rem;; move the zip file to the NWAPP_FOLDER
move "%APP_NAME%%APP_VERSION%.zip" %NWAPP_FOLDER%

pause