//dashboard
  const getTodayTasks = useCallback(async () => {
    if (profile.student.is_mentoring) {
      console.log("Iniciando busca pelas tarefas do dia");
      try {
        const response = await TaskApiMentoring.list(
          { day: moment().format('YYYY-MM-DD'), status: 'n' },
          token
        );
        console.log("Resposta da API:", response);
  
        const tasksReview = response.data?.results?.find(
          (task) => task.object_id !== null
        );
  
        if (tasksReview) {
          console.log("Tarefa de revisão encontrada:", tasksReview);
          <QuestionsComponent objectId={tasksReview.id} />

        } else {
          console.log("Nenhuma tarefa de revisão necessária para hoje.");
        }
  
        setTaskReviewToday(tasksReview);
      } catch (error) {
        console.error("Erro ao buscar tarefas do dia:", error);
      }
    } else {
      console.log("O estudante não está em mentoria.");
    }
  }, [profile.student.is_mentoring, token]);


//QuestionsComponent
export default function QuestionsComponent({
  id,
  institution,
  name,
  trackRunId,
  questionsLoaded,
  nextQuestions,
  questionItem,
  answers,
  canAnswer,
  setCanAnswer,
  deleted,
  hideFinishMessage,
  hideFinish,
  isFreemium,
  removeConfigs,
  trackId,
  reviewReleased,
  objectId,
  
}) {
  console.log("objectId no QuestionsComponent:", objectId); //isso aqui está voltando undefined
  
//HandleEndExam em questionscomponent
  async function handleEndExam(objectId, idTrack) {
    console.log("Recebido objectId:", objectId, "e idTrack:", idTrack);
    const payload = {
      ended_at: new Date().toISOString(),
      student: profile.student.id,
    };
  
    setLoading(true);
    setShowStopActions(false);
  
    try {
      const updateResult = await TrackRunAPI.update(currentTrackRunId, payload);
      const { data } = updateResult;
      if (data) {
        setTrackRun(data);
        setFinished(true);
  
        if (objectId) {
          await Axios.post(`https://homolog.ment.cms.medway.com.br/api/v1/task/${objectId}/`, { status: 'd' });
        } else {
          const response = await Axios.get(`https://homolog.ment.cms.medway.com.br/api/v1/task/?object_id=${idTrack}&day=2024-03-05`);
          const task = response.data?.results?.[0]; // Pegando a primeira task retornada
          if (task) {
            await Axios.post(`https://homolog.ment.cms.medway.com.br/api/v1/task/${task.id}/`, { status: 'd' });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao finalizar a trilha ou ao marcar a tarefa como concluída", error);
    } finally {
      setLoading(false);
      setShowFeedBack(true);
    }
  }
