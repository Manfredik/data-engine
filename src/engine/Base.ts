import EventEmitter2 from "eventemitter2";
import { defaults, defaultTo, get, set } from "lodash";

export class Base extends EventEmitter2 {
    private _options!: Record<string, any>;

    protected constructor(options: Options) {
        super();
        this.setOptions(options);
    }

    /**
     * @returns {string} The class name of this instance.
     */
    get $class(): string {
        return (Object.getPrototypeOf(this)).constructor.name;
    }

    /**
     * @param {Array|string} path     Option path resolved by `get`
     * @param {*}            fallback Fallback value if the option is not set.
     *
     * @returns {*} The value of the given option path.
     */
    getOption(path: string | string[], fallback: any = null): any {
        return get(this._options, path, fallback);
    }

    /**
     * @returns {Object} This instance's default options.
     */
    options(): Options {
        return {};
    }

    /**
     * Sets an option.
     *
     * @param {string} path
     * @param {*}      value
     */
    setOption(path: string, value: any): void {
        set(this._options, path, value);
    }

    /**
     * Sets all given options. Successive values for the same option won't be
     * overwritten, so this follows the 'defaults' behaviour, and not 'merge'.
     *
     * @param {...Object} options One or more objects of options.
     */
    setOptions(options: Options): void {
        this._options = defaults({}, options)
    }

    /**
     * Returns all the options that are currently set on this instance.
     *
     * @return {Object}
     */
    getOptions(): Options {
        return defaultTo(this._options, {});
    }
}

export interface Options {

}
