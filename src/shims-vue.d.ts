declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Seat {
  id: number;
  pos_x: number;
  pos_y: number;
  color: string;
}
