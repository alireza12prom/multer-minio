export interface IStorageOptions {
  /**
   * @description the path of the object in the bucket.
   * @example '/path/to/save/object/in/bucket'
   * @default {undefined}
   */
  path?: string;

  /**
   * @default {"us-east-1"}
   */
  region?: string;

  bucket?: {
    /**
     * @description create `bucket` if not exists.
     * @default {false}
     */
    init: boolean;

    /**
     * @default {false}
     */
    versioning: 'Enabled' | 'Suspended' | false;

    /**
     * @description with 'Enabled' versioning if `forceDelete: false`
     * the object is not removed permanently.
     * @default {false}
     */
    forceDelete: boolean;
  };
}
