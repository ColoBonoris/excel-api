// En el futuro, aquí se manejarán las consultas a MongoDB
export const saveUploadTask = async (taskId: string) => {
    console.log(`Simulación: Guardando tarea ${taskId} en la base de datos`);
};
  
export const getUploadStatus = async (taskId: string): Promise<string> => {
    console.log(`Simulación: Consultando estado de ${taskId} en la base de datos`);
    return "pending";
};
  