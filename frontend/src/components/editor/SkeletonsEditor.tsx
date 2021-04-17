import Editor from "@monaco-editor/react"
import React, { useState, MouseEvent, ChangeEvent } from "react"
import { Input, InputOnChangeData, Menu, MenuItemProps } from "semantic-ui-react"
import { ProblemStateProps } from "."

const SkeletonsEditor = ({ problem, setProblem }: ProblemStateProps): JSX.Element => {
  const [activeSkeleton, setActiveSkeleton] = useState('python')

  if (!problem || !setProblem) return <></>

  const handleSkeletonClick = (event: MouseEvent, data: MenuItemProps) => setActiveSkeleton(data.tab)

  const handleSkeletonChange = (language: string, value?: string) => {
    if (setProblem !== undefined) {
      setProblem({
        ...problem,
        skeletons: problem.skeletons?.map((skeleton) =>
          language == skeleton.language ? {
            ...skeleton,
            source: value || ''
          } : skeleton
        )
      })
    }
  }

  const handleChange = (_event: ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    if (setProblem !== undefined) {
      setProblem({
        ...problem,
        skeletons: problem.skeletons?.map((skeleton) =>
          activeSkeleton == skeleton.language ? { ...skeleton, file_name: value || '' } : skeleton
        )
      })
    }
  }

  return <>
    <Menu>
      {problem?.skeletons?.map((skeleton, index) => (
        <Menu.Item
          key={`skeleton-${index}`}
          name={skeleton.language}
          tab={skeleton.language}
          active={activeSkeleton == skeleton.language}
          onClick={handleSkeletonClick} />
      ))}
      <Menu.Item position='right'>
        {problem.skeletons?.map((skeleton) =>
        (skeleton.language == activeSkeleton ?
          <Input
            label='Filename'
            size='small'
            name='filename'
            value={skeleton.file_name}
            onChange={handleChange} />
          : <></>)
        )}
      </Menu.Item>
    </Menu>
    {problem?.skeletons?.map((skeleton, index) =>
      <div key={`skeleton-${index}`}>
        {skeleton.language == activeSkeleton ?
          <Editor
            language={skeleton.language}
            width="100%"
            height="500px"
            theme="vs"
            value={skeleton.source}
            options={{ minimap: { enabled: false } }}
            onChange={(value?: string) => handleSkeletonChange(skeleton.language, value)}
          /> : <></>}
      </div>
    )}
  </>
}

export default SkeletonsEditor