export type ConfigLoaderFn<T> = () => T;
export class ConfigLoader {
    loaderMap: Map<string, ConfigLoaderFn<any>> = new Map();
    registerLoader<T>(key: string, loader: ConfigLoaderFn<T>) {
        this.loaderMap.set(key, loader);
    }
    getLoader<T>(key: string): ConfigLoaderFn<T> | undefined {
        return this.loaderMap.get(key);
    }
}
export type ConfigCompilerFn<T> = (value: T) => any;
export class ConfigCompiler {
    compilerMap: Map<string, ConfigCompilerFn<any>> = new Map();
    registerCompiler<T>(key: string, compiler: ConfigCompilerFn<T>) {
        this.compilerMap.set(key, compiler);
    }
    getCompiler<T>(key: string): ConfigCompilerFn<T> | undefined {
        return this.compilerMap.get(key);
    }
}

export interface ConfigMeta {
    prop: string;
    params?: string[];
    loaderKey?:string;
    compilerKey?:string;
}

export function useConfig(){
    const loader = new ConfigLoader();
    const compiler = new ConfigCompiler();
    const configMetaList: ConfigMeta[] = [];
    function addConfigMeta(meta: ConfigMeta) {
        configMetaList.push(meta);
    }
    function compile(): {[key:string]: any} {
        const result: {[key:string]: any} = {};
        for (const {prop, loaderKey, compilerKey} of configMetaList) {
            if (!loaderKey) continue;

            const loaderFn = loader.getLoader<any>(loaderKey);
            if (!loaderFn) continue;

            const value = loaderFn();

            const compiled = compilerKey
                ? (compiler.getCompiler<any>(compilerKey)?.(value) ?? value)
                : value;

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
