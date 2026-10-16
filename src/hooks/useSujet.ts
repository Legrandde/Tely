import { useEffect, useState } from "react";
import api from "../api/axio";

interface SujetInterface{
    id: string,
    titre: string
    annee: string      
    session:string
    type: string
    matiere:{nom: string}
    niveau: {libelle:string}
    
    ennonce: string
}

export default function UseSujet(){

    const [sujet, setSujet] = useState<SujetInterface[]>([]);
    const [loadingSujet, setLoading] = useState<boolean>(true);
    const [err, setErr] = useState<string | null | unknown>(null);

    useEffect(()=>{
        const fetchSujet = async ()=>{
           try{
                const response = await api.get<SujetInterface[]>('api/sujets')
                const data = Array.isArray(response.data) ? response.data : response.data  || []
                setSujet(data)
                console.log(response.data)
                setLoading(false)
           }
           catch(err: any ){
            setErr(err.message)
            setSujet([])
           }
        };
        fetchSujet()
    }, [])

    return {sujet, loadingSujet, err};
}