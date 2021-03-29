import { Problem } from 'abacus'
import React, { MouseEvent, useState } from 'react'
import { Menu, Button, MenuItemProps } from 'semantic-ui-react'
import { Block } from 'components'
import ProblemInfoEditor from './ProblemInfoEditor'
import TestDataEditor from './TestDataEditor'
import DescriptionEditor from './DescriptionEditor'
import SkeletonsEditor from './SkeletonsEditor'
import SolutionsEditor from './SolutionsEditor'
import TemplateEditor from './TemplateEditor'

interface ProblemEditorProps {
  problem?: Problem
  handleSubmit: (problem: Problem) => void;
}

const ProblemEditor = ({ problem: defaultProblem, handleSubmit }: ProblemEditorProps): JSX.Element => {
  const [problem, setProblem] = useState<Problem>(defaultProblem || {
    pid: '',
    id: '',
    name: '',
    division: '',
    description: ''
  })

  const [activeItem, setActiveItem] = useState<string>('problem-info')
  const handleItemClick = (_event: MouseEvent, data: MenuItemProps) => setActiveItem(data.tab)

  return <>
    <Menu attached='top' tabular>
      <Menu.Item name='Problem Info' tab='problem-info' active={activeItem === 'problem-info'} onClick={handleItemClick} />
      <Menu.Item name='Description' tab='description' active={activeItem === 'description'} onClick={handleItemClick} />
      {problem.division == 'blue' ? <>
        <Menu.Item name='Test Data' tab='test-data' active={activeItem === 'test-data'} onClick={handleItemClick} />
        <Menu.Item name='Skeletons' tab='skeletons' active={activeItem === 'skeletons'} onClick={handleItemClick} />
        <Menu.Item name='Solutions' tab='solutions' active={activeItem === 'solutions'} onClick={handleItemClick} />
      </> : <></>}
      {problem.division == 'gold' ? <>
        <Menu.Item name='Template' tab='template' active={activeItem === 'template'} onClick={handleItemClick} />
      </> : <></>}
    </Menu>

    <Block size='xs-12' style={{ padding: '20px', background: 'white', border: '1px solid #d4d4d5', borderTop: 'none' }}>
      {(() => {
        switch (activeItem) {
          case 'problem-info': return <ProblemInfoEditor problem={problem} setProblem={setProblem} />
          case 'test-data': return <TestDataEditor problem={problem} setProblem={setProblem} />
          case 'description': return <DescriptionEditor problem={problem} setProblem={setProblem} />
          case 'skeletons': return <SkeletonsEditor problem={problem} setProblem={setProblem} />
          case 'solutions': return <SolutionsEditor problem={problem} setProblem={setProblem} />
          case 'template': return <TemplateEditor problem={problem} setProblem={setProblem} />
          default: return <></>
        }
      })()}
      <Button primary onClick={() => handleSubmit(problem)}>Save</Button>
    </Block>
  </>
}

export default ProblemEditor