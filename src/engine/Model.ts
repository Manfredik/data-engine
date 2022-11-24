import { Base } from "./Base";
import { Collection } from "./Collection";

import values from 'lodash/values';
import { cloneDeep, defaults, has, invert, isPlainObject, get, isEqual, forOwn } from "lodash";

const RESERVED = invert([
    '_attributes',
    '_collections',
    '_errors',
    '_listeners',
    '_reference',
    '_registry',
    '_uid',
    'attributes',
    'collections',
    'deleting',
    'errors',
    'fatal',
    'loading',
    'memoized',
    'models',
    'saving',
]);

export class Model<T> extends Base {

    private readonly _attributes!: T;
    private readonly _collections!: Collection[];

    /**
     * @returns {Object} This model's "active" state attributes.
     */
    get attributes(): T {
        return this._attributes;
    }

    /**
     * @returns {Object} The collection that this model is registered to.
     */
    get collections(): Collection[] {
        return values(this._collections);
    }

    constructor(attributes:T, collection: Collection | null = null, options = {}) {
        super(options);

        // Assign all given model data to the model's attributes and reference.
        this.assign(attributes);
    }

    defaults(): Partial<T> {
        return {};
    }

    /**
     * Determines if the model has an attribute.
     *
     * @param  {string}  attribute
     * @returns {boolean} `true` if an attribute exists, `false` otherwise.
     *                   Will return true if the object exists but is undefined.
     */
    has(attribute: string): boolean {
        return has(this._attributes, attribute);
    }

    /**
     * Similar to `saved`, returns an attribute's value or a fallback value
     * if this model doesn't have the attribute.
     *
     * @param {string} attribute
     * @param {*}      fallback
     *
     * @returns {*} The value of the attribute or `fallback` if not found.
     */
    get(attribute: string, fallback?: any): any {
        return get(this._attributes, attribute, fallback);
    }

    set(attribute: string | T, value?: T[keyof T]): T[keyof T] | undefined {
        // Allow batch set of multiple attributes at once, ie. set({...});
        if (isPlainObject(attribute)) {
            forOwn(attribute as T, (value, key): void => {
                this.set(key, value);
            });
            return;
        }

        let defined: boolean = this.has(attribute as string);

        // Only register the pass-through property if it's not already set up.
        // If it already exists on the instance, we know it has been.
        if (!defined) {
            this.registerAttribute(attribute as string);
        }

        // Current value of the attribute, or `undefined` if not set
        let previous: any = this.get(attribute as string);

        // Run the attribute's mutations if required to do so on change.
        //if (this.getOption('mutateOnChange')) {
        //    value = this.mutated(attribute as string, value);
        //}

        // Only consider a change if the attribute was already defined.
        let changed: boolean = defined && !isEqual(previous, value);

        if (changed) {
            // Emit the change event after
            this.emit('change', { attribute, previous, value });
        }

        return value;
    }

    registerAttribute(attribute: string): void {
        // Protect against unwillingly using an attribute name that already
        // exists as an internal property or method name.
        if (has(RESERVED, attribute)) {
            throw new Error(`Can't use reserved attribute name '${attribute}'`);
        }

        // Create dynamic accessors and mutations so that we can update the
        // model directly while also keeping the model attributes in sync.
        Object.defineProperty(this, attribute, {
            get: (): any => this.get(attribute),
            set: (value: T[keyof T]): T[keyof T] | undefined => this.set(attribute, value),
        });
    }

    protected assign(attributes: T): void {
        this.set(defaults({}, attributes, cloneDeep(this.defaults())));
    }
}


