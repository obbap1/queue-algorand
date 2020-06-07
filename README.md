# Queues + Typescript + MongoDB

Handle transactions without serially waiting for every transaction to finish.

## Pseudocode

1. Send transaction to Queue.
2. Queue waits for confirmation, add confirmation to DB.
3. Remove from Queue.
4. Run tests/benchmarks against serial method.
