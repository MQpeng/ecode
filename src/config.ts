/**
 * Config loader function type. A loader returns a value of type T.
 */
export type ConfigLoaderFn<T> = () => T;

/**
 * A registry for config loader functions keyed by string.
 */
export class ConfigLoader {
    loaderMap: Map<string, ConfigLoaderFn<unknown>> = new Map();

    /**
     * Register a loader function under a key.
     */
    registerLoader<T>(key: string, loader: ConfigLoaderFn<T>) {
        this.loaderMap.set(key, loader as ConfigLoaderFn<unknown>);
    }

    /**
     * Retrieve a loader function by key.
     */
    getLoader<T>(key: string): ConfigLoaderFn<T> | undefined {
        return this.loaderMap.get(key) as ConfigLoaderFn<T> | undefined;
    }
}

/**
 * Config compiler function type. Takes a loaded value and returns a compiled representation.
 */
export type ConfigCompilerFn<T> = (value: T) => unknown;

/**
 * A registry for compiler functions keyed by string.
 */
export class ConfigCompiler {
    compilerMap: Map<string, ConfigCompilerFn<unknown>> = new Map();

    /**
     * Register a compiler function under a key.
     */
    registerCompiler<T>(key: string, compiler: ConfigCompilerFn<T>) {
        this.compilerMap.set(key, compiler as ConfigCompilerFn<unknown>);
    }

    /**
     * Retrieve a compiler function by key.
     */
    getCompiler<T>(key: string): ConfigCompilerFn<T> | undefined {
        return this.compilerMap.get(key) as ConfigCompilerFn<T> | undefined;
    }
}

/**
 * Metadata describing a configuration entry.
 */
export interface ConfigMeta {
    prop: string;
    params?: string[];
    loaderKey?:string;
    compilerKey?:string;
}

/**
 * Provides a small config framework with loader/compiler registries and meta list.
 * - Register loaders/compilers via `loader`/`compiler`.
 * - Add config metas via `addConfigMeta`.
 * - Call `compile()` to resolve loaders and apply compilers where configured.
 */
export function useConfig(){
    const loader = new ConfigLoader();
    const compiler = new ConfigCompiler();
    const configMetaList: ConfigMeta[] = [];

    /**
     * Append a config meta to the list. Metas control which loader/compiler are used for a property.
     */
    function addConfigMeta(meta: ConfigMeta) {
        configMetaList.push(meta);
    }

    /**
     * Compile the current config metas into a plain object.
     * Only metas with `loaderKey` set will be considered.
     */
    function compile(): {[key:string]: unknown} {
        const result: {[key:string]: unknown} = {};
        for (const {prop, loaderKey, compilerKey} of configMetaList) {
            if (!loaderKey) continue;

            const loaderFn = loader.getLoader<unknown>(loaderKey);
            if (!loaderFn) continue;

            const value = loaderFn();

            const compiled = (() => {
                if (!compilerKey) return value;
                const compilerFn = compiler.getCompiler<unknown>(compilerKey);
                return compilerFn ? compilerFn(value) ?? value : value;
            })();

            result[prop] = compiled;
        }
        return result;
    }
    return {
        loader,
        compiler,
        configMetaList,
        addConfigMeta,
        compile
    }
}
