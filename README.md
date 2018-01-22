# service-worker-is-slowing-down-pageload

Demostrates that service worker is actually delaying the pageload by testing against https://jakearchibald.github.io/service-worker-benchmark/

## Running

```
git clone https://github.com/arthow4n/service-worker-is-slowing-down-pageload
npm install # postinstall script will run "npm test" automatically
```

## Results example

```
> node test-sw-benchmark.js

Testing (w/ service worker): [====================]
[pageLoad] Min: 730ms. Max: 889ms. Average: 818.9ms
[firstPaint] Min: 178ms. Max: 300ms. Average: 195.25ms
Testing (w/o service worker): [====================]
[pageLoad] Min: 408ms. Max: 658ms. Average: 484ms
[firstPaint] Min: 191ms. Max: 347ms. Average: 229.55ms
```
