export const sampleLogs = {
  bruteForce: `198.51.100.42 - - [19/May/2026:22:01:05 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:08 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:12 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:15 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:18 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:21 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:24 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:27 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:30 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:33 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:36 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:39 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:42 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:45 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:48 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:51 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:54 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:01:57 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:00 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:03 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:06 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:09 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:12 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:15 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:18 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:21 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:24 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:27 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:30 +0000] "POST /login HTTP/1.1" 401 532 "https://example.com/login" "Mozilla/5.0"
198.51.100.42 - - [19/May/2026:22:02:35 +0000] "POST /login HTTP/1.1" 200 4821 "https://example.com/login" "Mozilla/5.0"`,

  sqlInjection: `203.0.113.88 - - [19/May/2026:22:05:01 +0000] "GET /items?category=all HTTP/1.1" 200 1250 "-" "Nikto/2.1.6"
203.0.113.88 - - [19/May/2026:22:05:03 +0000] "GET /items?category=1%20or%201=1 HTTP/1.1" 500 245 "-" "Nikto/2.1.6"
203.0.113.88 - - [19/May/2026:22:05:06 +0000] "GET /items?category=1'%20OR%20'1'='1 HTTP/1.1" 500 245 "-" "Nikto/2.1.6"
203.0.113.88 - - [19/May/2026:22:05:08 +0000] "GET /items?category=1%20AND%201=2 HTTP/1.1" 500 245 "-" "Nikto/2.1.6"
203.0.113.88 - - [19/May/2026:22:05:11 +0000] "GET /items?category=1' -- HTTP/1.1" 500 245 "-" "Nikto/2.1.6"
203.0.113.88 - - [19/May/2026:22:05:14 +0000] "GET /items?category=1'%20UNION%20SELECT%20null,username,password%20FROM%20users-- HTTP/1.1" 500 312 "-" "Nikto/2.1.6"
203.0.113.88 - - [19/May/2026:22:05:18 +0000] "GET /items?category=1'%20UNION%20SELECT%201,table_name,3%20FROM%20information_schema.tables-- HTTP/1.1" 500 312 "-" "Mozilla/5.0"
203.0.113.88 - - [19/May/2026:22:05:22 +0000] "GET /items?category=1'%20UNION%20SELECT%201,column_name,3%20FROM%20information_schema.columns%20WHERE%20table_name='users'-- HTTP/1.1" 500 312 "-" "Mozilla/5.0"
203.0.113.88 - - [19/May/2026:22:05:26 +0000] "GET /items?category=1'%20UNION%20SELECT%20id,username,password_hash%20FROM%20users-- HTTP/1.1" 200 8900 "-" "Mozilla/5.0"
203.0.113.88 - - [19/May/2026:22:05:30 +0000] "GET /admin HTTP/1.1" 403 220 "-" "Mozilla/5.0"`,

  privilegeEscalation: `May 19 22:10:01 web-server-01 sshd[12450]: Accepted publickey for jsmith from 192.0.2.110 port 49152 ssh2
May 19 22:10:05 web-server-01 sudo[12462]:   jsmith : TTY=pts/0 ; PWD=/home/jsmith ; USER=root ; COMMAND=/usr/bin/apt-get update
May 19 22:10:20 web-server-01 sudo[12470]:   jsmith : PAM auth error - Permission denied ; TTY=pts/0 ; PWD=/home/jsmith ; USER=root ; COMMAND=/usr/bin/su -
May 19 22:10:35 web-server-01 sudo[12488]:   jsmith : 3 incorrect password attempts ; TTY=pts/0 ; PWD=/home/jsmith ; USER=root ; COMMAND=/bin/bash
May 19 22:11:02 web-server-01 sudo[12512]:   jsmith : TTY=pts/0 ; PWD=/home/jsmith ; USER=root ; COMMAND=/usr/bin/find . -exec /bin/sh -uuid \\;
May 19 22:11:05 web-server-01 kernel: [38291.102910] type=1400 audit(1779228665.102:402): avc: denied { execute } for pid=12513 comm="sh" name="bash" dev="sda1" ino=1420
May 19 22:11:15 web-server-01 sudo[12520]:   jsmith : TTY=pts/0 ; PWD=/home/jsmith ; USER=root ; COMMAND=/usr/bin/pip install -e .
May 19 22:11:20 web-server-01 sudo[12530]:   jsmith : TTY=pts/0 ; PWD=/home/jsmith ; USER=root ; COMMAND=/usr/bin/python -c import os; os.setuid(0); os.system('/bin/bash')
May 19 22:11:21 web-server-01 systemd[1]: Created slice User Slice of root.
May 19 22:11:21 web-server-01 systemd[1]: Starting User Manager for UID 0...
May 19 22:11:22 web-server-01 sudo[12530]:   jsmith : TTY=pts/0 ; PWD=/home/jsmith ; USER=root ; COMMAND=/bin/bash (SUCCESSFUL ESCALATION)
May 19 22:11:45 web-server-01 cat[12550]: Reading sensitive file: /etc/shadow
May 19 22:12:00 web-server-01 useradd[12560]: new user: name=backdoor, UID=0, GID=0, home=/root, shell=/bin/bash`,

  portScan: `05/19/2026-22:15:00.102839  [**] [1:2001210:3] ET SCAN Potential SSH Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53120 -> 172.16.42.10:22
05/19/2026-22:15:01.302198  [**] [1:2001211:3] ET SCAN Potential Web Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53122 -> 172.16.42.10:80
05/19/2026-22:15:01.450121  [**] [1:2001212:3] ET SCAN Potential HTTPS Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53124 -> 172.16.42.10:443
05/19/2026-22:15:01.602819  [**] [1:2001213:3] ET SCAN Potential RDP Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53126 -> 172.16.42.10:3389
05/19/2026-22:15:01.810291  [**] [1:2001214:3] ET SCAN Potential SMB Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53128 -> 172.16.42.10:445
05/19/2026-22:15:02.019281  [**] [1:2001215:3] ET SCAN Potential FTP Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53130 -> 172.16.42.10:21
05/19/2026-22:15:02.210982  [**] [1:2001216:3] ET SCAN Potential Telnet Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53132 -> 172.16.42.10:23
05/19/2026-22:15:02.402910  [**] [1:2001217:3] ET SCAN Potential SMTP Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53134 -> 172.16.42.10:25
05/19/2026-22:15:02.601982  [**] [1:2001218:3] ET SCAN Potential DNS Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53136 -> 172.16.42.10:53
05/19/2026-22:15:02.802911  [**] [1:2001219:3] ET SCAN Potential MySQL Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53138 -> 172.16.42.10:3306
05/19/2026-22:15:03.001920  [**] [1:2001220:3] ET SCAN Potential PostgreSQL Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53140 -> 172.16.42.10:5432
05/19/2026-22:15:03.203912  [**] [1:2001221:3] ET SCAN Potential VNC Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53142 -> 172.16.42.10:5900
05/19/2026-22:15:03.410291  [**] [1:2001222:3] ET SCAN Potential Redis Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53144 -> 172.16.42.10:6379
05/19/2026-22:15:03.602981  [**] [1:2001223:3] ET SCAN Potential Elasticsearch Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53146 -> 172.16.42.10:9200
05/19/2026-22:15:03.801982  [**] [1:2001224:3] ET SCAN Potential WinRM Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53148 -> 172.16.42.10:5985
05/19/2026-22:15:04.019201  [**] [1:2001225:3] ET SCAN Potential MongoDB Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 198.51.100.99:53150 -> 172.16.42.10:27017`
};
