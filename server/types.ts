import http  from 'http';
import { User } from '../client/src/types';

export type Methods = "CONNECT" | "PUT" | "GET" | "DELETE" | "POST" | "OPTION";
export type RouteCallback = (
  req: http.IncomingMessage & { body: Record<string, unknown> },
  res: http.ServerResponse
) => unknown;

export function userPredicate(value: unknown): value is User{
    return (value != null && typeof value === "object" && "password" in value && "email "in value  && "type" in value && "name" in value && "avatar" in value && "id" in value && "messages" in value && "blockedContacts" in value && "chats" in value)
 }