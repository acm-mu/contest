import { Settings, User } from "abacus";
import { createContext, Dispatch, SetStateAction } from "react";

export interface AppContextType {
  user?: User;
  setUser: Dispatch<SetStateAction<undefined>>;
  socket?: SocketIOClient.Socket;
  settings?: Settings;
}

const AppContext = createContext<AppContextType>({
  user: undefined,
  setUser: () => { return },
  settings: undefined,
  socket: undefined
})

export default AppContext
