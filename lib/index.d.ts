import * as React from "react";
export declare type ReadParser = (term: Term, env: Params, state: unknown) => Json;
export declare type MutateParser = (term: [Tag, Params?], env: Params, state: unknown) => Json;
export declare type RemoteParser = (term: Term, state: unknown) => Term;
export declare type SyncParser = (term: Term, result: any, env: Params, state: unknown) => void;
export declare const parsers: {
    read: (id: any, parser: any) => void;
    mutate: (id: any, parser: any) => void;
    remote: (id: any, parser: any) => void;
    sync: (id: any, parser: any) => void;
};
export declare type Json = string | number | boolean | null | {
    [property: string]: Json;
} | Json[];
declare type TransactQuery = (Tag | [Tag] | [Tag, Params])[];
export declare type QLComponent = React.FunctionComponent<Props>;
declare type BasicProps = {
    [propName: string]: string | number | [] | {} | boolean | BasicProps | BasicProps[] | undefined;
    key?: string;
    __env?: BasicProps;
    __query?: Query;
    __queryKey?: string;
    __parentProps?: BasicProps;
};
declare type Utils = {
    render: (ctx: BasicProps | BasicProps[] | unknown, Component: QLComponent) => JSX.Element | JSX.Element[];
    transact: (query: TransactQuery) => void;
};
declare type Context = {
    __env: BasicProps;
    __query: Query;
};
export declare type Props = BasicProps & Utils & Context;
export declare type Tag = string;
export declare type Params = {
    [property: string]: Json;
};
export declare type Term = [Tag, Params, ...Term[]];
export declare type Query = Term[];
export declare type ShortTerm = Tag | [Tag] | [Tag, Params] | [Tag, ...(Query | Term | QLComponent)[]] | [Tag, Params, ...(Query | Term | QLComponent)[]];
export declare type ShortQuery = ShortTerm[];
export declare const component: (query: ShortQuery, target: QLComponent) => QLComponent;
export declare function getQuery(key: QLComponent): Query;
export declare function clearRegistry(): void;
export declare function parseChildrenRemote([dispatchKey, params, ...chi]: Term): (string | Term | Params)[];
export declare function parseChildren(term: Term, __env: BasicProps & Context, _state?: object): BasicProps & Context;
export declare function init({ state: _st, remoteHandler: _rh }: {
    state: any;
    remoteHandler: any;
}): ({ Component, element }: {
    Component: QLComponent;
    element: HTMLElement;
}) => void;
export {};
