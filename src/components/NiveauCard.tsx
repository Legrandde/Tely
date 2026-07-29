export default function NiveauCard(){

    return(
        <div className="flex shadow  gap-7">
            <img src="https://i.pinimg.com/1200x/4c/d2/9c/4cd29cafd1d8d83376fbf9d158605d39.jpg" alt="" className="w-96" />
            <div className="flex w-64 items-center justify-center gap-4 flex-col text-center">
                <h1 className="text-2xl font-semibold text-start ">Elémentaire</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum consequuntur autem iste eligendi, quod in!</p>
                <div className="flex  gap-3">
                    <button className="bg-amber-500 p-1 rounded-lg text-white">Commencer</button>
                    <button className="rounded-lg shadow p-1">Connexion</button>
                </div>
            </div>
        </div>
    )
}