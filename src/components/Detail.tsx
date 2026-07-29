interface detailProps{
    titre: string, 
    couleur?: string, 
}

export default function Detail({couleur, titre}: detailProps){

    return(
        <div className={`flex text-gray-700 w-fit ${couleur? couleur: " border-amber-500"} p-1 rounded-3xl text-center justify-center items-center border-2`}>
            {titre}
        </div>
    )
}