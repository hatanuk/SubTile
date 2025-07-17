class Metrics {

    testEfficiency(fn, ...args) {
        const start = performance.now();
        fn(...args);
        const end = performance.now();
        console.log(`Execution time: ${(end - start).toFixed(4)} ms`);
}

    testMethodEfficiency(obj, methodName, ...args) {
        let trials = 30
        let sum = 0

        for (let i = 0; i < trials; i++) {
            const start = performance.now();
            obj[methodName](...args);
            const end = performance.now();
            sum += (end - start)
        }
        console.log(`${methodName} executed in ${(sum / trials).toFixed(4)} ms`)
    }
}