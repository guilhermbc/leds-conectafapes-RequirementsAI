from langchain_core.runnables import RunnableLambda

def final_return_func(inputs):
    print("Returning final state.")
    return inputs

final_return = RunnableLambda(final_return_func)
