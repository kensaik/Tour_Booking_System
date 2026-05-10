-- Enable MySQL slow query log dynamically for the perf rig.
-- Captures every query slower than 100ms. Re-run with long_query_time=0 to capture all.
-- Persistent alternative: set in my.cnf under [mysqld]:
--   slow_query_log = 1
--   long_query_time = 0.1
--   slow_query_log_file = /var/log/mysql/slow.log

SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 0.1;
SET GLOBAL log_output = 'FILE';

-- Inspect current settings:
SHOW VARIABLES LIKE 'slow_query_log%';
SHOW VARIABLES LIKE 'long_query_time';
