import { Observable } from 'rxjs'

export type ObservableItem<T> = T extends Observable<infer U> ? U : never
