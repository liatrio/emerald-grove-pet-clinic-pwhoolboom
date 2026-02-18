# Task 4.0 Proof — curl Snippets

## Unfiltered Export

Command: `curl -i "http://localhost:8080/owners.csv"`

```text
HTTP/1.1 200
Content-Type: text/csv;charset=UTF-8
Content-Length: 582
Date: Tue, 17 Feb 2026 19:59:28 GMT

id,firstName,lastName,address,city,telephone
1,George,Franklin,110 W. Liberty St.,Madison,6085551023
2,Betty,Davis,638 Cardinal Ave.,Sun Prairie,6085551749
3,Eduardo,Rodriquez,2693 Commerce St.,McFarland,6085558763
4,Harold,Davis,563 Friendly St.,Windsor,6085553198
5,Peter,McTavish,2387 S. Fair Way,Madison,6085552765
6,Jean,Coleman,105 N. Lake St.,Monona,6085552654
7,Jeff,Black,1450 Oak Blvd.,Monona,6085555387
8,Maria,Escobito,345 Maple St.,Madison,6085557683
9,David,Schroeder,2749 Blackhawk Trail,Madison,6085559435
10,Carlos,Estaban,2335 Independence La.,Waunakee,6085555487
```

## Filtered Export (lastName=Davis)

Command: `curl -i "http://localhost:8080/owners.csv?lastName=Davis"`

```text
HTTP/1.1 200
Content-Type: text/csv;charset=UTF-8
Content-Length: 151
Date: Tue, 17 Feb 2026 19:59:30 GMT

id,firstName,lastName,address,city,telephone
2,Betty,Davis,638 Cardinal Ave.,Sun Prairie,6085551749
4,Harold,Davis,563 Friendly St.,Windsor,6085553198
```

## Verification

| Check | Result |
|---|---|
| Unfiltered: HTTP 200 status | PASS |
| Unfiltered: `Content-Type: text/csv` | PASS |
| Unfiltered: Header row present as first line | PASS |
| Unfiltered: All 10 seed owners returned | PASS |
| Filtered: HTTP 200 status | PASS |
| Filtered: Only owners with lastName starting with "Davis" returned | PASS |
| Filtered: Betty Davis and Harold Davis present; no other owners | PASS |
