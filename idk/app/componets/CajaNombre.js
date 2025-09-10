const CajaNombre = ({ datosNombre, indice }) => {
  return (
    <div className="caja-nombre" key={indice}>
      <div className="nombre-cabecera">{indice + 1} </div>
      <div className="nombre-amigo">{datosNombre.nombre}</div>
    </div>
  );
};

export default CajaNombre;
