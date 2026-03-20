import mockEntityImg from "./mock_entity.png";
import { GridEntity } from "../../features/arena/stores/arenaStore";

export function createMockEntity(cellId: number): GridEntity {
  return {
    id:       `mock_${Date.now()}_${cellId}`,
    type:     "monster",
    entityId: cellId,
    name:     "Obstacle",
    team:     "enemy",
    cellId,
    imageUrl: "",          // unused — we use localImage
    localImage: mockEntityImg,
    stats: {
      hp: 0, hpMax: 0, ap: 0, apMax: 0, mp: 0, mpMax: 0,
      earthRes: 0, fireRes: 0, waterRes: 0, airRes: 0, neutralRes: 0,
    },
    spells: [],
  };
}