@echo off
cd c:\wamp\www\
for /l %%i in (1,1,1150) do (
    c:\wamp\bin\php\php5.6.40\php.exe -f c:\wamp\www\exchange\api\exchange\job_list.php
    timeout 2
)
