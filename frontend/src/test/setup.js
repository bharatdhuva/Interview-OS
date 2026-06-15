import "@testing-library/jest-dom";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

