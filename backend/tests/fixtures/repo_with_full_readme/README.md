# Stargazer

Stargazer is a lightweight Python library for building reactive data pipelines
that stream events from many sources into a single, consistent processing graph.
It was created to solve a recurring problem on small data teams: every project
ends up reinventing the same glue code to fan events out, retry failures, and
backpressure slow consumers. Stargazer packages those patterns into a tiny,
dependency-free core that you can drop into any service.

The library favors explicitness over magic. Pipelines are plain Python objects,
nodes are ordinary functions, and the scheduler is a small, readable event loop
you can step through in a debugger. There is no hidden global state, no metaclass
trickery, and no required configuration files. If you can read a list
comprehension, you can read a Stargazer pipeline.

## Install

Stargazer is published on PyPI and supports Python 3.10 and newer. Install it
into your virtual environment with pip:

```bash
pip install stargazer
```

For development you can install the optional extras, which pull in the test
runner, type checker, and benchmark suite:

```bash
pip install "stargazer[dev]"
```

There are no compiled extensions, so installation works the same on Linux,
macOS, and Windows without a build toolchain.

## Usage

A pipeline is built by chaining nodes. Each node is a function that receives an
event and returns zero or more events for the next stage. Here is a complete
example that reads numbers, doubles the even ones, and prints the results:

```python
from stargazer import Pipeline

def only_even(n):
    if n % 2 == 0:
        yield n

def double(n):
    yield n * 2

pipe = Pipeline()
pipe.add(only_even).add(double).sink(print)

for value in range(10):
    pipe.feed(value)

pipe.drain()
```

Nodes can be synchronous generators, async coroutines, or plain functions.
Stargazer inspects each node once at registration time and wraps it so the
scheduler can treat every stage uniformly. Backpressure is handled by bounded
queues between stages, so a slow sink will naturally throttle upstream
producers rather than exhausting memory.

## Architecture

Internally Stargazer is built from three cooperating pieces. The **graph**
records the topology of nodes and the edges between them. The **scheduler** is a
cooperative event loop that walks the graph, pulling events from each node's
input queue and pushing results downstream. The **runtime** owns the queues,
tracks in-flight work, and decides when the pipeline has fully drained.

This separation keeps each component small and independently testable. The graph
knows nothing about execution; the scheduler knows nothing about how nodes are
implemented; the runtime knows nothing about user code. Most bugs reported
against the project have been isolated to a single layer, which makes them quick
to reproduce and fix.

Error handling is centralized in the runtime. When a node raises, the runtime
captures the exception, attaches the offending event, and routes it to an
optional dead-letter sink instead of crashing the whole pipeline. Retries use an
exponential backoff policy that you can override per node.

## Contributing

Contributions are welcome and appreciated. Before opening a pull request, please
run the full test suite and the type checker locally. We keep the core
dependency-free, so new runtime dependencies are generally rejected; if you need
a third-party package, propose it as an optional extra first.

Good first issues are tagged in the tracker. If you are unsure whether a change
fits the project direction, open a discussion thread before writing code so we
can save you wasted effort. All contributors are expected to follow the project
code of conduct.

## License

Stargazer is released under the MIT License. See the LICENSE file for the full
text. In short, you may use, modify, and distribute the library freely,
including in commercial products, provided you retain the copyright notice.
