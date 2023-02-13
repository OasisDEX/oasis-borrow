export function callBackIfDefined<CallbackType, DataType>(data: DataType, callback?: CallbackType) {
  if (typeof callback === 'function') {
    callback(data)
  }
}
