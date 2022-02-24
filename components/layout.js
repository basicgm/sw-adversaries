import CharacterView from './character-view.jsx';
import Filter from './input/filter.jsx';
import LinkList from './link-list.jsx';
import Tabs from './tabs.jsx';
import TagMenu from './tag-menu.jsx';

export default function Layout({ children }) {
  return (
    <>
      <TagMenu/>
      <Filter/>
      <LinkList/>
      <CharacterView/>
      <main>{children}</main>
      <Tabs tabs={[]}/>
    </>
  )
}
