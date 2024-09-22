import React from 'react';
import defaultImage from '../assets/default-image.png';

 const RoomCard = ({ room, view, handleAccess }) => {
   const { name, status, imageBase64, description, occupiedByEmployeeName } = room;
   const imageSrc = imageBase64 ? `data:image/png;base64,${imageBase64}` : defaultImage;

   return (
     <div className={`card ${view === 'grid' ? 'h-100' : 'flex-row mb-3'}`}>
       <div className="position-relative">
         <div style={view === 'grid' ? { height: '300px', overflow: 'hidden' } : { width: '300px', overflow: 'hidden' }}>
           <img src={imageSrc} className={`card-img-top ${view === 'list' ? 'w-50' : ''}`} alt={name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
         </div>
         { view === 'grid' && (
          <h5 className={`card-title position-absolute top-0 start-50 translate-middle-x bg-white p-2 px-4 mt-3 border-bottom border-${status ? 'danger' : 'success'} border-3 rounded-top`}>
           {name}
         </h5>
         )}
       </div>
       <div className={`card-body ${view === 'list' ? 'd-flex flex-row justify-content-between' : ''}`}>
         {view === 'list' && (
           <div className="d-flex flex-row gap-4">
             <h5 className="card-title">{name}</h5>
             <p className="card-text">{description}</p>
           </div>
         )}
         <div className={`d-flex ${view === 'list' ? 'flex-column' : 'justify-content-between align-items-center'}`}>
           <p className={`${view === 'list' ? 'badge' : 'p-2 rounded m-0'} ${status ? 'bg-danger' : 'bg-success'} text-white`}>
             {status ? 'Ocupado' : 'Disponível'}
           </p>
           <button className="btn btn-primary" onClick={() => {handleAccess(room)}}>Acessar</button>
         </div>
       </div>
     </div>
   );
 };

export default RoomCard;
