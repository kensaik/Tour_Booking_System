SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 0.1;
SET GLOBAL log_output = 'FILE';

SHOW VARIABLES LIKE 'slow_query_log%';
SHOW VARIABLES LIKE 'long_query_time';
